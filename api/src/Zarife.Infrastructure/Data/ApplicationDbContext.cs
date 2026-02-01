using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;
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

        // Rename Identity tables to use Application* prefix.
        modelBuilder.Entity<IdentityRole<Guid>>().ToTable("ApplicationRoles");
        modelBuilder.Entity<IdentityRoleClaim<Guid>>().ToTable("ApplicationRoleClaims");
        modelBuilder.Entity<ApplicationUser>().ToTable("ApplicationUsers");
        modelBuilder.Entity<IdentityUserClaim<Guid>>().ToTable("ApplicationUserClaims");
        modelBuilder.Entity<IdentityUserLogin<Guid>>().ToTable("ApplicationUserLogins");
        modelBuilder.Entity<IdentityUserRole<Guid>>().ToTable("ApplicationUserRoles");
        modelBuilder.Entity<IdentityUserToken<Guid>>().ToTable("ApplicationUserTokens");

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

internal sealed class DesignTimeDbContextFactory : IDesignTimeDbContextFactory<ApplicationDbContext>
{
    public ApplicationDbContext CreateDbContext(string[] args)
    {
        var basePath = Path.Combine(Directory.GetCurrentDirectory(), "api", "src", "Zarife.API");
        if (!Directory.Exists(basePath))
        {
            basePath = Directory.GetCurrentDirectory();
        }

        var configuration = new ConfigurationBuilder()
            .SetBasePath(basePath)
            .AddJsonFile("appsettings.json", optional: false)
            .AddJsonFile("appsettings.Development.json", optional: true)
            .AddEnvironmentVariables()
            .Build();

        var connectionString = configuration.GetConnectionString("DefaultConnection");
        if (string.IsNullOrWhiteSpace(connectionString))
        {
            throw new InvalidOperationException("Connection string 'DefaultConnection' was not found.");
        }

        var optionsBuilder = new DbContextOptionsBuilder<ApplicationDbContext>();
        optionsBuilder.UseNpgsql(connectionString);

        return new ApplicationDbContext(optionsBuilder.Options, new DesignTimeTenantService());
    }

    private sealed class DesignTimeTenantService : ITenantService
    {
        public Guid? TenantId => null;
        public void SetTenant(Guid tenantId) { }
    }
}
