from rest_framework import permissions

class HasPermission(permissions.BasePermission):
    """
    Standardized permission check for Adaptix microservices.
    
    Expects view to have 'required_permission' attribute.
    Checks against 'permissions' and 'roles' in request.user_claims (from JWT).
    """
    def has_permission(self, request, view):
        # 1. Allow if no permission required
        required_perm = getattr(view, "required_permission", None)
        if not required_perm:
            return True
        
        # 2. Check direct user object (Internal to service, e.g. Auth Service)
        if request.user and request.user.is_authenticated:
            if request.user.is_superuser:
                return True
            
            # Check for codename in combined perms if it's our User model
            if hasattr(request.user, 'roles'):
                # Collect covenames from roles and direct permissions
                perms = set(request.user.direct_permissions.values_list('codename', flat=True))
                for role in request.user.roles.prefetch_related('permissions').all():
                    perms.update(role.permissions.values_list('codename', flat=True))
                if required_perm in perms:
                    return True

        # 3. Check injected claims from JWT (Microservice standard)
        claims = getattr(request, "user_claims", {}) or {}
        
        # Superuser/Admin bypass
        roles = claims.get("roles", [])
        if "superuser" in roles or claims.get("is_superuser"):
            return True
            
        # Check specific permission list
        user_perms = claims.get("permissions", [])
        return required_perm in user_perms
