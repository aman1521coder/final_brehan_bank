package main

import (
    "net/http"

    "github.com/brehan/bank/cmd/middleware"
    "github.com/brehan/bank/cmd/service"
    "github.com/gin-gonic/gin"
    //"github.com/google/uuid"
)

type AuthHandler struct {
    authService *service.AuthService
}

func NewAuthHandler(authService *service.AuthService) *AuthHandler {
    return &AuthHandler{authService: authService}
}

type loginRequest struct {
    Name     string `json:"name" binding:"required"`
    Password string `json:"password" binding:"required"`
}

type registerRequest struct {
    Name     string `json:"name" binding:"required"`
    Password string `json:"password" binding:"required"`
    Role     string `json:"role" binding:"required"`
    District string `json:"district" binding:"required_if=Role district_manager"`
}

type authResponse struct {
    Token string `json:"token"`
    User  struct {
        ID       string `json:"id"`
        Name     string `json:"name"`
        Role     string `json:"role"`
        District string `json:"district,omitempty"`
    } `json:"user"`
}

func (h *AuthHandler) Login(c *gin.Context) {

    var req loginRequest
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
        return
    }

    user, role, district, err := h.authService.Login(req.Name, req.Password)
    if err != nil {
        if err == service.ErrInvalidCredentials {
            c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
            return
        }
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal server error"})
        return
    }

    token, err := middleware.GenerateToken(user.Id, role, district)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal server error"})
        return
    }

    response := authResponse{
        Token: token,
        User: struct {
            ID       string `json:"id"`
            Name     string `json:"name"`
            Role     string `json:"role"`
            District string `json:"district,omitempty"`
        }{
            ID:       user.Id.String(),
            Name:     user.Name,
            Role:     role,
            District: district,
        },
    }

    c.JSON(http.StatusOK, response)
}

func (h *AuthHandler) Register(c *gin.Context) {
    var req registerRequest
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
        return
    }

    user, role, district, err := h.authService.Register(req.Name, req.Password, req.Role, req.District)
    if err != nil {
        switch err {
        case service.ErrUserExists:
            c.JSON(http.StatusConflict, gin.H{"error": "User already exists"})
        case service.ErrInvalidRole:
            c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid role"})
        case service.ErrInvalidDistrict:
            c.JSON(http.StatusBadRequest, gin.H{"error": "District required for district_manager"})
        default:
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal server error"})
        }
        return
    }

    token, err := middleware.GenerateToken(user.Id, role, district)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal server error"})
        return
    }

    response := authResponse{
        Token: token,
        User: struct {
            ID       string `json:"id"`
            Name     string `json:"name"`
            Role     string `json:"role"`
            District string `json:"district,omitempty"`
        }{
            ID:       user.Id.String(),
            Name:     user.Name,
            Role:     role,
            District: district,
        },
    }

    c.JSON(http.StatusCreated, response)
}