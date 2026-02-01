using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Zarife.Core.Entities;
using Zarife.Core.Interfaces;
using Zarife.Infrastructure.Identity;

namespace Zarife.Infrastructure.Data;

public class ApplicationDbContext : IdentityDbContext<ApplicationUser, IdentityRole<Guid>, Guid>
{
    private readonly ITenantService _tenantService;

    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options, ITenantService tenantService)
        : base(options)
    {
        _tenantService = tenantService;
    }

    public DbSet<School> Schools => Set<School>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Global Query Filter for User (Multi-Tenancy)
        modelBuilder.Entity<ApplicationUser>()
            .HasQueryFilter(u => !_tenantService.TenantId.HasValue || u.TenantId == _tenantService.TenantId);

        // Configure indexes
        modelBuilder.Entity<School>()
            .HasIndex(s => s.Subdomain)
            .IsUnique();

        modelBuilder.Entity<ApplicationUser>()
            .HasIndex(u => new { u.TenantId, u.Email })
            .IsUnique();
    }

    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        foreach (var entry in ChangeTracker.Entries<ApplicationUser>())
        {
            if (entry.State == EntityState.Added && _tenantService.TenantId.HasValue)
            {
                entry.Entity.TenantId = _tenantService.TenantId.Value;
            }
        }

        return base.SaveChangesAsync(cancellationToken);
    }
}
