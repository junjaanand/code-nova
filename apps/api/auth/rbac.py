from typing import List, Callable
from fastapi import HTTPException, status, Depends
from packages.schemas.models import User, RoleEnum
from apps.api.auth.jwt import get_current_user_from_token

ROLE_PERMISSIONS = {
    RoleEnum.CREATOR: {
        "content:create", "content:edit_own", "content:submit",
        "finding:accept", "finding:reject", "finding:edit",
        "comment:add", "audit:view_own"
    },
    RoleEnum.MANAGER: {
        "content:create", "content:edit_own", "content:submit",
        "content:assign", "content:approve_standard", "content:request_changes",
        "finding:accept", "finding:reject", "finding:edit",
        "comment:add", "review_queue:view", "analytics:view"
    },
    RoleEnum.REVIEWER: {
        "content:approve_high_risk", "content:reject", "content:request_changes",
        "finding:override", "finding:accept", "finding:reject",
        "comment:add", "review_queue:view", "analytics:view"
    },
    RoleEnum.ADMIN: {
        "brand_pack:manage", "rules:manage", "facts:manage", "terms:manage", "assets:manage",
        "workspace:manage", "content:approve_high_risk", "finding:override",
        "guideline_health:clarify", "analytics:view", "audit:export"
    },
    RoleEnum.AUDITOR: {
        "audit:view_all", "audit:export", "content:view_all", "analytics:view",
        "brand_pack:view", "findings:view_all"
    }
}

def require_role(allowed_roles: List[RoleEnum]):
    def role_checker(current_user: User = Depends(get_current_user_from_token)) -> User:
        if current_user.role not in allowed_roles and current_user.role != RoleEnum.ADMIN:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Action forbidden for role '{current_user.role}'. Required: {[r.value for r in allowed_roles]}"
            )
        return current_user
    return role_checker

def require_permission(permission: str):
    def permission_checker(current_user: User = Depends(get_current_user_from_token)) -> User:
        user_perms = ROLE_PERMISSIONS.get(current_user.role, set())
        # Admins have master permissions
        if current_user.role == RoleEnum.ADMIN or permission in user_perms:
            return current_user
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Permission '{permission}' denied for role '{current_user.role}'."
        )
    return permission_checker
