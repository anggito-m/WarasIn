package handler

import (
	"net/http"
	"strconv"

	"warasin/internal/usecase"

	"github.com/gin-gonic/gin"
)

type paymentHandler struct {
	paymentUsecase usecase.PaymentUsecase
}

// NewPaymentHandler creates a new payment handler
func NewPaymentHandler(paymentUsecase usecase.PaymentUsecase) *paymentHandler {
	return &paymentHandler{
		paymentUsecase: paymentUsecase,
	}
}

func (h *paymentHandler) CreatePayment(c *gin.Context) {
	userID, _ := c.Get("userID")

	var request struct {
		PremiumType   string  `json:"premium_type" binding:"required"`
		PaymentMethod string  `json:"payment_method" binding:"required"`
		Amount        float64 `json:"amount" binding:"required"`
	}

	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   true,
			"message": err.Error(),
		})
		return
	}

	payment, err := h.paymentUsecase.CreatePayment(userID.(int), request.PremiumType, request.PaymentMethod, request.Amount)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   true,
			"message": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, payment)
}

func (h *paymentHandler) GetPaymentHistory(c *gin.Context) {
	userID, _ := c.Get("userID")

	// Parse query parameters
	limitStr := c.DefaultQuery("limit", "10")
	offsetStr := c.DefaultQuery("offset", "0")
	status := c.Query("status")

	limit, err := strconv.Atoi(limitStr)
	if err != nil {
		limit = 10
	}

	offset, err := strconv.Atoi(offsetStr)
	if err != nil {
		offset = 0
	}

	payments, total, err := h.paymentUsecase.GetPaymentHistory(userID.(int), limit, offset, status)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   true,
			"message": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"total":    total,
		"payments": payments,
	})
}
