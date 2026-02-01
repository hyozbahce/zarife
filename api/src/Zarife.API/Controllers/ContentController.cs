using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Minio;
using Minio.DataModel.Args;
using Zarife.Core.Entities;
using Zarife.Infrastructure.Data;

namespace Zarife.API.Controllers;

[Authorize(Roles = "PlatformAdmin,SchoolAdmin")]
[ApiController]
[Route("api/[controller]")]
public class ContentController(
    ApplicationDbContext context,
    IMinioClient minioClient,
    IConfiguration configuration) : ControllerBase
{
    [HttpPost("upload")]
    public async Task<ActionResult> Upload(IFormFile file, [FromQuery] string bucket = "books", [FromQuery] string? assetType = null)
    {
        if (file.Length == 0)
            return BadRequest("File is empty.");

        var objectKey = $"{DateTime.UtcNow:yyyy/MM/dd}/{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";

        await using var stream = file.OpenReadStream();
        var putArgs = new PutObjectArgs()
            .WithBucket(bucket)
            .WithObject(objectKey)
            .WithStreamData(stream)
            .WithObjectSize(file.Length)
            .WithContentType(file.ContentType);

        await minioClient.PutObjectAsync(putArgs);

        var storageEndpoint = configuration["Storage:Endpoint"] ?? "localhost:13003";
        var url = $"http://{storageEndpoint}/{bucket}/{objectKey}";

        var asset = new MediaAsset
        {
            FileName = file.FileName,
            ContentType = file.ContentType,
            SizeBytes = file.Length,
            BucketName = bucket,
            ObjectKey = objectKey,
            Url = url,
            AssetType = assetType ?? DetectAssetType(file.ContentType)
        };

        context.MediaAssets.Add(asset);
        await context.SaveChangesAsync();

        return Ok(new
        {
            id = asset.Id,
            url = asset.Url,
            fileName = asset.FileName,
            contentType = asset.ContentType,
            sizeBytes = asset.SizeBytes,
            assetType = asset.AssetType
        });
    }

    [HttpGet("assets")]
    public async Task<ActionResult> GetAssets([FromQuery] string? assetType, [FromQuery] string? bucket)
    {
        var query = context.MediaAssets.AsQueryable();

        if (!string.IsNullOrEmpty(assetType))
            query = query.Where(a => a.AssetType == assetType);

        if (!string.IsNullOrEmpty(bucket))
            query = query.Where(a => a.BucketName == bucket);

        var assets = await query
            .OrderByDescending(a => a.CreatedAt)
            .Select(a => new
            {
                a.Id,
                a.FileName,
                a.ContentType,
                a.SizeBytes,
                a.Url,
                a.AssetType,
                a.BucketName,
                a.CreatedAt
            })
            .ToListAsync();

        return Ok(assets);
    }

    [HttpDelete("assets/{id}")]
    public async Task<IActionResult> DeleteAsset(Guid id)
    {
        var asset = await context.MediaAssets.FindAsync(id);
        if (asset == null) return NotFound();

        var removeArgs = new RemoveObjectArgs()
            .WithBucket(asset.BucketName)
            .WithObject(asset.ObjectKey);

        await minioClient.RemoveObjectAsync(removeArgs);

        context.MediaAssets.Remove(asset);
        await context.SaveChangesAsync();

        return NoContent();
    }

    private static string DetectAssetType(string contentType)
    {
        if (contentType.StartsWith("image/")) return "image";
        if (contentType.StartsWith("audio/")) return "audio";
        if (contentType.StartsWith("video/")) return "video";
        if (contentType.Contains("rive") || contentType.Contains("octet-stream")) return "rive";
        if (contentType.Contains("json")) return "animation";
        return "other";
    }
}
