using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.IO;

namespace InteractHub.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UploadsController : ControllerBase
{
    private readonly IWebHostEnvironment _env;

    public UploadsController(IWebHostEnvironment env)
    {
        _env = env;
    }

    // POST /api/uploads/image
    [HttpPost("image")]
    [Authorize]
    public async Task<IActionResult> UploadImage([FromForm] IFormFile imageFile)
    {
        if (imageFile == null || imageFile.Length == 0)
            return BadRequest(new { message = "No file uploaded" });

        var webRoot = _env.WebRootPath ?? Path.Combine(_env.ContentRootPath, "wwwroot");
        var uploadsPath = Path.Combine(webRoot, "uploads");
        Directory.CreateDirectory(uploadsPath);

        var ext = Path.GetExtension(imageFile.FileName);
        if (string.IsNullOrWhiteSpace(ext))
            ext = ".png";

        var fileName = $"{Guid.NewGuid()}{ext}";
        var filePath = Path.Combine(uploadsPath, fileName);

        await using (var stream = System.IO.File.Create(filePath))
        {
            await imageFile.CopyToAsync(stream);
        }

        // Served by app.UseStaticFiles() from /wwwroot/uploads
        var imageUrl = $"/uploads/{fileName}";
        return Ok(new { imageUrl });
    }
}

