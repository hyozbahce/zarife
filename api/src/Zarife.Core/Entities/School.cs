using System;
using System.Collections.Generic;

namespace Zarife.Core.Entities;

public class School : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string Subdomain { get; set; } = string.Empty;
    public string? LicenseType { get; set; }
    public string? SettingsJson { get; set; }

    public ICollection<User> Users { get; set; } = new List<User>();
}
