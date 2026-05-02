using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using InteractHub.Infrastructure.Data;
using InteractHub.Core.Entities;
using InteractHub.Infrastructure.Services;
using Swashbuckle.AspNetCore.SwaggerGen;
using Microsoft.OpenApi.Models;
using InteractHub.Core.Interfaces;

var builder = WebApplication.CreateBuilder(args);

// Database
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration
        .GetConnectionString("DefaultConnection")));

// Identity
builder.Services.AddIdentity<User, IdentityRole>(options =>
{
    options.User.AllowedUserNameCharacters = null; // cho phép dấu tiếng Việt
})
.AddEntityFrameworkStores<AppDbContext>()
.AddDefaultTokenProviders();
builder.Services.AddScoped<IUserValidator<User>, NoOpUsernameValidator<User>>();
// JWT Authentication
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = builder.Configuration["Jwt:Issuer"],
        ValidAudience = builder.Configuration["Jwt:Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]!))
    };
});

// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", policy =>
    {
       policy.WithOrigins(
    "http://localhost:5173",
    "http://localhost:5174",
    "http://interacthub-frontend.s3-website-ap-southeast-1.amazonaws.com"
);
    });
});

// JwtService
builder.Services.AddScoped<JwtService>();
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddScoped<IPostService, PostService>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IFriendService, FriendService>();
builder.Services.AddScoped<IStoryService, StoryService>();
builder.Services.AddScoped<INotificationService, NotificationService>();

// Swagger với JWT support
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "InteractHub API", Version = "v1" });
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Nhập token: Bearer {token}"
    });
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

var app = builder.Build();

try
{
    using var scope = app.Services.CreateScope();
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.Migrate();
    Console.WriteLine("✅ Database migration successful");
}
catch (Exception ex)
{
    Console.WriteLine($"⚠️ Migration failed: {ex.Message} - continuing...");
}

// Error handling middleware
app.UseExceptionHandler(errorApp =>
{
    errorApp.Run(async context =>
    {
        var exceptionHandlerPathFeature = context.Features.Get<Microsoft.AspNetCore.Diagnostics.IExceptionHandlerPathFeature>();
        var exception = exceptionHandlerPathFeature?.Error;

        Console.WriteLine($"ERROR: {exception?.Message}");
        Console.WriteLine($"STACK TRACE: {exception?.StackTrace}");

        context.Response.StatusCode = 500;
        context.Response.ContentType = "application/json";
        await context.Response.WriteAsJsonAsync(new { message = exception?.Message, stackTrace = exception?.StackTrace });
    });
});

// Swagger PHẢI trước CORS
app.UseSwagger();
app.UseSwaggerUI(c => c.SwaggerEndpoint("/swagger/v1/swagger.json", "InteractHub API v1"));

app.UseCors("AllowReactApp");
app.UseStaticFiles(); // for serving uploaded images from /wwwroot/uploads
app.UseAuthentication(); // phải trước UseAuthorization
app.UseAuthorization();
app.MapControllers();

// Seed user test
using (var scope = app.Services.CreateScope())
{
    var userManager = scope.ServiceProvider.GetRequiredService<UserManager<User>>();
    
    var testUser = await userManager.FindByEmailAsync("test@example.com");
    if (testUser == null)
    {
        var newUser = new User
        {
            Id = Guid.NewGuid().ToString(),
            UserName = "testuser",
            Email = "test@example.com",
            FullName = "Test User",
            NormalizedUserName = "TESTUSER",
            NormalizedEmail = "TEST@EXAMPLE.COM",
            EmailConfirmed = true
        };
        
        var result = await userManager.CreateAsync(newUser, "Test@123");
        if (result.Succeeded)
        {
            Console.WriteLine("✅ Test user created: test@example.com / Test@123");
        }
        else
        {
            Console.WriteLine("❌ Failed to create test user");
        }
    }
    else
    {
        Console.WriteLine("✅ Test user already exists: test@example.com");
    }

    // Create second test user
    var secondUser = await userManager.FindByEmailAsync("phanvann47@gmail.com");
    if (secondUser == null)
    {
        var newUser = new User
        {
            Id = Guid.NewGuid().ToString(),
            UserName = "phanvan",
            Email = "phanvann47@gmail.com",
            FullName = "Phan Van",
            NormalizedUserName = "PHANVAN",
            NormalizedEmail = "PHANVANN47@GMAIL.COM",
            EmailConfirmed = true
        };
        
        var result = await userManager.CreateAsync(newUser, "Phan@123");
        if (result.Succeeded)
        {
            Console.WriteLine("✅ Second user created: phanvann47@gmail.com / Phan@123");
        }
        else
        {
            Console.WriteLine("❌ Failed to create second user");
            foreach (var error in result.Errors)
            {
                Console.WriteLine($"   Error: {error.Code} - {error.Description}");
            }
        }
    }
    else
    {
        Console.WriteLine("✅ Second user already exists: phanvann47@gmail.com");
    }
}

app.Run();