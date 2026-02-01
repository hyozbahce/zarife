using System;

namespace Zarife.Core.Interfaces;

public interface ITenantService
{
    Guid? TenantId { get; }
    void SetTenant(Guid tenantId);
}
