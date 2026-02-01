namespace Zarife.Core.Entities;

public class MediaAsset : BaseEntity
{
    public string FileName { get; set; } = string.Empty;
    public string ContentType { get; set; } = string.Empty;
    public long SizeBytes { get; set; }
    public string BucketName { get; set; } = string.Empty;
    public string ObjectKey { get; set; } = string.Empty;
    public string? Url { get; set; }
    public string AssetType { get; set; } = string.Empty; // image, animation, audio, rive
    public Guid? UploadedByUserId { get; set; }
}
