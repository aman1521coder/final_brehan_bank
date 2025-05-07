package api

import (
	"encoding/json"
	"net/http"

	"github.com/brehan/bank/cmd/middleware"
	"github.com/brehan/bank/cmd/service"
)

type AuthHandler struct {
	authService *service.AuthService
}

func NewAuthHandler(authService *service.AuthService) *AuthHandler {
	return &AuthHandler{authService: authService}
}

type loginRequest struct {
	Name     string `json:"name"`
	Password string `json:"password"`
}

type registerRequest struct {
	Name     string `json:"name"`
	Password string `json:"password"`
	Role     string `json:"role"`
}

type authResponse struct {
	Token string `json:"token"`
	User  struct {
		ID   string `json:"id"`
		Name string `json:"name"`
		Role string `json:"role"`
	} `json:"user"`
}

func (h *AuthHandler) Login(w http.ResponseWriter, r *http.Request) {
	var req loginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	user, err := h.authService.Login(req.Name, req.Password)
	if err != nil {
		if err == service.ErrInvalidCredentials {
			http.Error(w, "Invalid credentials", http.StatusUnauthorized)
			return
		}
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}

	token, err := middleware.GenerateToken(user.ID, user.Role)
	if err != nil {
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}

	response := authResponse{
		Token: token,
		User: struct {
			ID   string `json:"id"`
			Name string `json:"name"`
			Role string `json:"role"`
		}{
			ID:   user.ID.String(),
			Name: user.Name,
			Role: user.Role,
		},
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func (h *AuthHandler) Register(w http.ResponseWriter, r *http.Request) {
	var req registerRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	user, err := h.authService.Register(req.Name, req.Password, req.Role)
	if err != nil {
		switch err {
		case service.ErrUserExists:
			http.Error(w, "User already exists", http.StatusConflict)
		case service.ErrInvalidRole:
			http.Error(w, "Invalid role", http.StatusBadRequest)
		default:
			http.Error(w, "Internal server error", http.StatusInternalServerError)
		}
		return
	}

	token, err := middleware.GenerateToken(user.ID, user.Role)
	if err != nil {
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}

	response := authResponse{
		Token: token,
		User: struct {
			ID   string `json:"id"`
			Name string `json:"name"`
			Role string `json:"role"`
		}{
			ID:   user.ID.String(),
			Name: user.Name,
			Role: user.Role,
		},
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(response)
} 