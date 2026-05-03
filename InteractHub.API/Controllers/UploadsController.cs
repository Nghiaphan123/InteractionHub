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
    private readonly Amazon.S3.IAmazonS3 _s3Client;

    public UploadsController(IWebHostEnvironment env, Amazon.S3.IAmazonS3 s3Client)
    {
        _env = env;
        _s3Client = s3Client;
    }

    // POST /api/uploads/image
    [HttpPost("image")]
    [Authorize]
    [Consumes("multipart/form-data")]
    [ProducesResponseType(typeof(UploadImageResponse), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> UploadImage([FromForm] IFormFile imageFile)
    {
        if (imageFile == null || imageFile.Length == 0)
            return BadRequest(new { message = "No file uploaded" });

        var ext = Path.GetExtension(imageFile.FileName);
        if (string.IsNullOrWhiteSpace(ext))
            ext = ".png";

        var fileName = $"images/{Guid.NewGuid()}{ext}";

        using var stream = imageFile.OpenReadStream();
        var uploadRequest = new Amazon.S3.Transfer.TransferUtilityUploadRequest
        {
            InputStream = stream,
            Key = fileName,
            BucketName = "interacthub-uploads",
            ContentType = imageFile.ContentType,
            CannedACL = Amazon.S3.S3CannedACL.PublicRead
        };

        var transferUtility = new Amazon.S3.Transfer.TransferUtility(_s3Client);
        await transferUtility.UploadAsync(uploadRequest);

        var imageUrl = $"https://interacthub-uploads.s3.ap-southeast-1.amazonaws.com/{fileName}";
        return Ok(new UploadImageResponse { ImageUrl = imageUrl });
    }
}

public class UploadImageResponse
{
    public string ImageUrl { get; set; }
}

