module.exports = {
  BAD_REQUEST: 400,
  NOT_FOUND: 404,
  SERVER_ERROR: 500,
  CONFLICT: 409,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,

  MESSAGES: {
    BAD_REQUEST: "Bad request",
    NOT_FOUND: "Resource not found",
    SERVER_ERROR: "Internal server error",
    USER_NOT_FOUND: "User not found",
    ITEM_NOT_FOUND: "Item not found",
    EMAIL_CONFLICT: "A user with this email already exists",
    CONFLICT: "A resource with the provided information already exists.",
    UNAUTHORIZED: "Incorrect email or password",
    FORBIDDEN: "You do not have permission to perform this action."
  },
};
