using System;
namespace Zarife.Core.Entities;

public class School : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string Subdomain { get; set; } = string.Empty;
    public string? LicenseType { get; set; }
    public string? SettingsJson { get; set; }

}
