package middleware

import (
    "errors"
    "net/http"
    "strings"
    "time"

    "github.com/dgrijalva/jwt-go"
    "github.com/gin-gonic/gin"
    "github.com/google/uuid"
)

var (
    ErrInvalidToken = errors.New("invalid token")
    ErrNoToken      = errors.New("no token provided")
    ErrInvalidRole  = errors.New("invalid role")
)

type Claims struct {
    UserID   uuid.UUID `json:"user_id"`
    Role     string    `json:"role"`
    District string    `json:"district,omitempty"`
    jwt.StandardClaims
}

const (
    UserIDKey = "user_id"
    RoleKey   = "role"
)

var jwtKey = []byte("your-secret-key") // Replace with env variable in production

func GenerateToken(userID uuid.UUID, role string, district string) (string, error) {
    expirationTime := time.Now().Add(24 * time.Hour)
    claims := &Claims{
        UserID:   userID,
        Role:     role,
        District: district,
        StandardClaims: jwt.StandardClaims{
            ExpiresAt: expirationTime.Unix(),
        },
    }

    token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
    return token.SignedString(jwtKey)
}

func AuthMiddleware(c *gin.Context) {
    authHeader := c.GetHeader("Authorization")
    if authHeader == "" {
        c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": ErrNoToken.Error()})
        return
    }

    tokenString := strings.TrimPrefix(authHeader, "Bearer ")
    claims := &Claims{}

    token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
        return jwtKey, nil
    })

    if err != nil || !token.Valid {
        c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": ErrInvalidToken.Error()})
        return
    }

    c.Set(UserIDKey, claims.UserID)
    c.Set(RoleKey, claims.Role)
    c.Next()
}

func RequireRole(roles ...string) gin.HandlerFunc {
    return func(c *gin.Context) {
        roleValue, exists := c.Get(RoleKey)
        if !exists {
            c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": ErrInvalidToken.Error()})
            return
        }

        role, ok := roleValue.(string)
        if !ok {
            c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"error": "invalid role type"})
            return
        }

        for _, allowed := range roles {
            if role == allowed {
                c.Next()
                return
            }
        }

        c.AbortWithStatusJSON(http.StatusForbidden, gin.H{"error": ErrInvalidRole.Error()})
    }
}

func GetUserIDFromContext(c *gin.Context) (uuid.UUID, error) {
    id, exists := c.Get(UserIDKey)
    if !exists {
        return uuid.Nil, ErrInvalidToken
    }
    userID, ok := id.(uuid.UUID)
    if !ok {
        return uuid.Nil, ErrInvalidToken
    }
    return userID, nil
}

func GetRoleFromContext(c *gin.Context) (string, error) {
    role, exists := c.Get(RoleKey)
    if !exists {
        return "", ErrInvalidToken
    }
    roleStr, ok := role.(string)
    if !ok {
        return "", ErrInvalidToken
    }
    return roleStr, nil
}