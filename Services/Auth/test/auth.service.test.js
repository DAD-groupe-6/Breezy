const axios = require("axios");

jest.mock("axios");
jest.mock("../src/utils/bcrypt.util", () => ({
  hashPassword: jest.fn(),
  comparePassword: jest.fn(),
}));
jest.mock("../src/utils/jwt.util", () => ({
  generateToken: jest.fn(),
}));
jest.mock("../src/models", () => ({
  User: {
    findOne: jest.fn(),
    create: jest.fn(),
  },
  Role: {
    findByPk: jest.fn(),
  },
}));

const { hashPassword, comparePassword } = require("../src/utils/bcrypt.util");
const { generateToken } = require("../src/utils/jwt.util");
const { User, Role } = require("../src/models");
const AuthService = require("../src/services/auth.service");

describe("AuthService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("register", () => {
    it("throws when email already exists", async () => {
      User.findOne.mockResolvedValue({ id: 1, email: "taken@example.com" });

      await expect(
        AuthService.register("taken@example.com", "pwd", "uniq", "pseudo")
      ).rejects.toThrow("Email already exists");
    });

    it("throws when roleId is invalid", async () => {
      User.findOne.mockResolvedValue(null);

      await expect(
        AuthService.register("new@example.com", "pwd", "uniq", "pseudo", "abc")
      ).rejects.toThrow("Invalid roleId");
    });

    it("throws when role does not exist", async () => {
      User.findOne.mockResolvedValue(null);
      Role.findByPk.mockResolvedValue(null);

      await expect(
        AuthService.register("new@example.com", "pwd", "uniq", "pseudo", "99")
      ).rejects.toThrow("Role not found");
    });

    it("creates user and profile when input is valid", async () => {
      User.findOne.mockResolvedValue(null);
      Role.findByPk.mockResolvedValue({ id: 2 });
      hashPassword.mockResolvedValue("hashed");
      User.create.mockResolvedValue({
        id: 10,
        email: "ok@example.com",
        roleId: 2,
        destroy: jest.fn(),
      });
      axios.post.mockResolvedValue({ data: {} });

      const result = await AuthService.register(
        "ok@example.com",
        "pwd",
        "uniq_10",
        "John",
        "2"
      );

      expect(hashPassword).toHaveBeenCalledWith("pwd");
      expect(User.create).toHaveBeenCalledWith({
        email: "ok@example.com",
        passwordHash: "hashed",
        roleId: 2,
      });
      expect(axios.post).toHaveBeenCalled();
      expect(result).toEqual({ id: 10, email: "ok@example.com", roleId: 2 });
    });

    it("rolls back created user when profile creation fails", async () => {
      const destroy = jest.fn().mockResolvedValue(undefined);
      User.findOne.mockResolvedValue(null);
      hashPassword.mockResolvedValue("hashed");
      User.create.mockResolvedValue({
        id: 11,
        email: "rollback@example.com",
        roleId: null,
        destroy,
      });
      axios.post.mockRejectedValue({
        response: { data: { message: "Profile API failed" } },
      });

      await expect(
        AuthService.register("rollback@example.com", "pwd", "uniq", "John")
      ).rejects.toThrow("Profile API failed");

      expect(destroy).toHaveBeenCalledTimes(1);
    });
  });

  describe("assertUserNotBanned", () => {
    it("passes when user is not banned", async () => {
      axios.get.mockResolvedValue({ data: { banned_until: null } });

      await expect(AuthService.assertUserNotBanned(1)).resolves.toBeUndefined();
    });

    it("throws when ban is active", async () => {
      axios.get.mockResolvedValue({
        data: { banned_until: "2999-01-01T00:00:00.000Z" },
      });

      await expect(AuthService.assertUserNotBanned(1)).rejects.toThrow(
        "Account is banned"
      );
    });

    it("maps 404 to user profile not found", async () => {
      axios.get.mockRejectedValue({ response: { status: 404 } });

      await expect(AuthService.assertUserNotBanned(1)).rejects.toThrow(
        "User profile not found"
      );
    });

    it("maps unknown errors to generic validation error", async () => {
      axios.get.mockRejectedValue(new Error("timeout"));

      await expect(AuthService.assertUserNotBanned(1)).rejects.toThrow(
        "Unable to validate account status"
      );
    });
  });

  describe("login", () => {
    it("throws when user does not exist", async () => {
      User.findOne.mockResolvedValue(null);

      await expect(AuthService.login("missing@example.com", "pwd")).rejects.toThrow(
        "Invalid credentials"
      );
    });

    it("throws when password is invalid", async () => {
      User.findOne.mockResolvedValue({ id: 7, passwordHash: "h", roleId: 1 });
      comparePassword.mockResolvedValue(false);

      await expect(AuthService.login("a@example.com", "bad")).rejects.toThrow(
        "Invalid credentials"
      );
    });

    it("throws when account is banned", async () => {
      User.findOne.mockResolvedValue({ id: 7, passwordHash: "h", roleId: 1 });
      comparePassword.mockResolvedValue(true);
      axios.get.mockResolvedValue({
        data: { banned_until: "2999-01-01T00:00:00.000Z" },
      });

      await expect(AuthService.login("a@example.com", "pwd")).rejects.toThrow(
        "Account is banned"
      );
    });

    it("returns token when credentials are valid", async () => {
      User.findOne.mockResolvedValue({ id: 8, passwordHash: "h", roleId: 3 });
      comparePassword.mockResolvedValue(true);
      axios.get.mockResolvedValue({ data: { banned_until: null } });
      generateToken.mockReturnValue("signed-token");

      const result = await AuthService.login("ok@example.com", "pwd");

      expect(generateToken).toHaveBeenCalledWith({ id: 8, roleId: 3, role: 3 });
      expect(result).toEqual({ token: "signed-token" });
    });
  });
});
