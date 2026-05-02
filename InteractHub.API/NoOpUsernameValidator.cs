using Microsoft.AspNetCore.Identity;

public class NoOpUsernameValidator<TUser> : IUserValidator<TUser> where TUser : class
{
    public Task<IdentityResult> ValidateAsync(UserManager<TUser> manager, TUser user)
    {
        return Task.FromResult(IdentityResult.Success);
    }
}