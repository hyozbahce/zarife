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
    public DbSet<Class> Classes => Set<Class>();
    public DbSet<Book> Books => Set<Book>();
    public DbSet<BookPage> BookPages => Set<BookPage>();
    public DbSet<BookAssignment> BookAssignments => Set<BookAssignment>();
    public DbSet<ReadingProgress> ReadingProgress => Set<ReadingProgress>();
    public DbSet<MediaAsset> MediaAssets => Set<MediaAsset>();
    public DbSet<StudentProfile> StudentProfiles => Set<StudentProfile>();

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

        // Class configuration
        modelBuilder.Entity<Class>(entity =>
        {
            entity.HasIndex(c => new { c.TenantId, c.Name });
            entity.HasOne(c => c.School)
                .WithMany()
                .HasForeignKey(c => c.TenantId)
                .OnDelete(DeleteBehavior.Cascade);
            entity.HasQueryFilter(c => !_tenantService.TenantId.HasValue || c.TenantId == _tenantService.TenantId);
        });

        // Book configuration
        modelBuilder.Entity<Book>(entity =>
        {
            entity.HasIndex(b => b.Status);
            entity.HasIndex(b => b.Title);
        });

        // BookPage configuration
        modelBuilder.Entity<BookPage>(entity =>
        {
            entity.HasIndex(bp => new { bp.BookId, bp.PageNumber }).IsUnique();
            entity.HasOne(bp => bp.Book)
                .WithMany(b => b.Pages)
                .HasForeignKey(bp => bp.BookId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // BookAssignment configuration
        modelBuilder.Entity<BookAssignment>(entity =>
        {
            entity.HasIndex(ba => ba.TenantId);
            entity.HasOne(ba => ba.Book)
                .WithMany(b => b.Assignments)
                .HasForeignKey(ba => ba.BookId)
                .OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(ba => ba.Class)
                .WithMany()
                .HasForeignKey(ba => ba.ClassId)
                .OnDelete(DeleteBehavior.SetNull);
            entity.HasQueryFilter(ba => !_tenantService.TenantId.HasValue || ba.TenantId == _tenantService.TenantId);
        });

        // ReadingProgress configuration
        modelBuilder.Entity<ReadingProgress>(entity =>
        {
            entity.HasIndex(rp => new { rp.UserId, rp.BookId }).IsUnique();
            entity.HasIndex(rp => rp.TenantId);
            entity.HasOne(rp => rp.Book)
                .WithMany()
                .HasForeignKey(rp => rp.BookId)
                .OnDelete(DeleteBehavior.Cascade);
            entity.HasQueryFilter(rp => !_tenantService.TenantId.HasValue || rp.TenantId == _tenantService.TenantId);
        });

        // MediaAsset configuration
        modelBuilder.Entity<MediaAsset>(entity =>
        {
            entity.HasIndex(ma => ma.AssetType);
            entity.HasIndex(ma => new { ma.BucketName, ma.ObjectKey }).IsUnique();
        });

        // StudentProfile configuration
        modelBuilder.Entity<StudentProfile>(entity =>
        {
            entity.HasIndex(sp => sp.UserId).IsUnique();
            entity.HasIndex(sp => sp.TenantId);
            entity.HasIndex(sp => sp.SchoolCode);
            entity.HasOne(sp => sp.Class)
                .WithMany()
                .HasForeignKey(sp => sp.ClassId)
                .OnDelete(DeleteBehavior.SetNull);
            entity.HasQueryFilter(sp => !_tenantService.TenantId.HasValue || sp.TenantId == _tenantService.TenantId);
        });
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
