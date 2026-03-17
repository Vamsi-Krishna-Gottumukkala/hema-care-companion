from fastapi import APIRouter, HTTPException, status
from app.auth.models import (
    UserRegister, UserLogin, GoogleLoginRequest,
    TokenResponse, UserResponse,
)
from app.auth.utils import hash_password, verify_password, create_access_token, generate_avatar
from app.database import get_supabase_admin
from fastapi import Depends
from app.auth.dependencies import get_current_user
import google.auth.transport.requests
from google.oauth2 import id_token as google_id_token

router = APIRouter(prefix="/api/auth", tags=["Auth"])


@router.post("/register", response_model=TokenResponse)
async def register(body: UserRegister):
    sb = get_supabase_admin()

    # Check if email already exists
    existing = sb.table("users").select("id").eq("email", body.email).execute()
    if existing.data:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered",
        )

    avatar = generate_avatar(body.name)
    user_data = {
        "name": body.name,
        "email": body.email,
        "password_hash": hash_password(body.password),
        "role": "user",
        "phone": body.phone,
        "age": body.age,
        "avatar": avatar,
        "status": "active",
    }

    result = sb.table("users").insert(user_data).execute()
    if not result.data:
        raise HTTPException(status_code=500, detail="Failed to create user")

    user = result.data[0]
    token = create_access_token(user["id"], user["role"])

    return TokenResponse(
        access_token=token,
        user=UserResponse(
            id=user["id"],
            name=user["name"],
            email=user["email"],
            role=user["role"],
            phone=user.get("phone"),
            age=user.get("age"),
            avatar=user["avatar"],
            status=user["status"],
            created_at=user.get("created_at"),
        ),
    )


@router.post("/login", response_model=TokenResponse)
async def login(body: UserLogin):
    sb = get_supabase_admin()

    result = sb.table("users").select("*").eq("email", body.email).execute()
    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    user = result.data[0]

    if user.get("status") == "disabled":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is disabled",
        )

    if not user.get("password_hash") or not verify_password(body.password, user["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    token = create_access_token(user["id"], user["role"])

    return TokenResponse(
        access_token=token,
        user=UserResponse(
            id=user["id"],
            name=user["name"],
            email=user["email"],
            role=user["role"],
            phone=user.get("phone"),
            age=user.get("age"),
            avatar=user["avatar"],
            status=user["status"],
            created_at=user.get("created_at"),
        ),
    )


@router.post("/login/google", response_model=TokenResponse)
async def login_google(body: GoogleLoginRequest):
    """Authenticate via Google OAuth ID token."""
    try:
        request = google.auth.transport.requests.Request()
        idinfo = google_id_token.verify_oauth2_token(body.id_token, request)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Google token",
        )

    email = idinfo.get("email")
    name = idinfo.get("name", email.split("@")[0])

    if not email:
        raise HTTPException(status_code=400, detail="Google token missing email")

    sb = get_supabase_admin()

    # Check if user exists
    result = sb.table("users").select("*").eq("email", email).execute()

    if result.data:
        user = result.data[0]
        if user.get("status") == "disabled":
            raise HTTPException(status_code=403, detail="Account is disabled")
    else:
        # Auto-register Google user
        avatar = generate_avatar(name)
        user_data = {
            "name": name,
            "email": email,
            "password_hash": "",  # No password for Google users
            "role": "user",
            "avatar": avatar,
            "status": "active",
        }
        insert_result = sb.table("users").insert(user_data).execute()
        if not insert_result.data:
            raise HTTPException(status_code=500, detail="Failed to create user")
        user = insert_result.data[0]

    token = create_access_token(user["id"], user["role"])

    return TokenResponse(
        access_token=token,
        user=UserResponse(
            id=user["id"],
            name=user["name"],
            email=user["email"],
            role=user["role"],
            phone=user.get("phone"),
            age=user.get("age"),
            avatar=user["avatar"],
            status=user["status"],
            created_at=user.get("created_at"),
        ),
    )


@router.get("/me", response_model=UserResponse)
async def get_me(user: dict = Depends(get_current_user)):
    return UserResponse(
        id=user["id"],
        name=user["name"],
        email=user["email"],
        role=user["role"],
        phone=user.get("phone"),
        age=user.get("age"),
        avatar=user["avatar"],
        status=user["status"],
        created_at=user.get("created_at"),
    )
