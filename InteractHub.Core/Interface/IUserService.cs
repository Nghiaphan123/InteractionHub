using InteractHub.Core.DTOs.Users;

namespace InteractHub.Core.Interfaces;

public interface IUserService
{
    Task<UserResponseDto?> GetUserByIdAsync(string userId);
    Task<UserResponseDto?> UpdateProfileAsync(string userId, UpdateProfileDto dto);
    Task<List<UserResponseDto>> SearchUsersAsync(string keyword);
}