using Minio;
using Minio.DataModel.Args;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Configuration;

namespace Zarife.Infrastructure.Storage;

public interface IStorageInitializer
{
    Task InitializeBucketsAsync();
}

public class MinioStorageInitializer : IStorageInitializer
{
    private readonly IMinioClient _minioClient;
    private readonly ILogger<MinioStorageInitializer> _logger;
    private readonly string[] _buckets = { "books", "animations", "audio", "avatars" };

    public MinioStorageInitializer(IMinioClient minioClient, ILogger<MinioStorageInitializer> logger)
    {
        _minioClient = minioClient;
        _logger = logger;
    }

    public async Task InitializeBucketsAsync()
    {
        try
        {
            foreach (var bucket in _buckets)
            {
                var existsArgs = new BucketExistsArgs().WithBucket(bucket);
                bool exists = await _minioClient.BucketExistsAsync(existsArgs);

                if (!exists)
                {
                    _logger.LogInformation("Creating MinIO bucket: {Bucket}", bucket);
                    var makeArgs = new MakeBucketArgs().WithBucket(bucket);
                    await _minioClient.MakeBucketAsync(makeArgs);

                    // Optional: Set public policy if needed for web access
                    // For now, we'll keep them private or handle access via signed URLs
                }
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error initializing MinIO buckets");
            throw;
        }
    }
}
