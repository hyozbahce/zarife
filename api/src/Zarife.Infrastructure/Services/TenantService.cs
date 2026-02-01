using System;
using Zarife.Core.Interfaces;

namespace Zarife.Infrastructure.Services;

public class TenantService : ITenantService
{
    public Guid? TenantId { get; private set; }

    public void SetTenant(Guid tenantId)
    {
        TenantId = tenantId;
    }
}
