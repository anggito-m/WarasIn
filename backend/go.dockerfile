FROM golang:1.20-alpine AS builder

# Install necessary tools
RUN apk add --no-cache git make

# Set the working directory
WORKDIR /app

# Copy go.mod and go.sum files
COPY go.mod go.sum ./

# Download dependencies
RUN go mod download

# Copy the source code
COPY . .

# Build the application
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o warasin-api ./cmd/api

# Use a minimal alpine image for the final image
FROM alpine:3.18

# Install required packages
RUN apk --no-cache add ca-certificates tzdata

# Set working directory
WORKDIR /app

# Copy the binary from the builder stage
COPY --from=builder /app/warasin-api .
COPY --from=builder /app/migrations ./migrations
COPY --from=builder /app/.env .

# Expose the application port
EXPOSE 8080

# Run the binary
CMD ["./warasin-api"]