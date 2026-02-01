using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Minio;
using Minio.DataModel.Args;
using Zarife.Infrastructure.Data;
using Zarife.Infrastructure.Identity;

namespace Zarife.Infrastructure.Services;

public interface IAppInitializer
{
    Task InitializeAsync();
}

public class AppInitializer(
    ApplicationDbContext context, 
    IMinioClient minioClient,
    UserManager<ApplicationUser> userManager,
    RoleManager<IdentityRole<Guid>> roleManager,
    IConfiguration configuration,
    ILogger<AppInitializer> logger) : IAppInitializer
{
    private readonly string[] _buckets = { "books", "animations", "audio", "avatars" };
    private readonly string[] _roles = { "PlatformAdmin", "SchoolAdmin", "Teacher", "Parent", "Student" };

    public async Task InitializeAsync()
    {
        try
        {
            logger.LogInformation("Starting application infrastructure initialization...");

            // 1. Database Migrations
            logger.LogInformation("Applying database migrations...");
            await context.Database.MigrateAsync();
            logger.LogInformation("Database migrations applied successfully.");

            // 2. Role Seeding
            logger.LogInformation("Seeding roles...");
            foreach (var roleName in _roles)
            {
                if (!await roleManager.RoleExistsAsync(roleName))
                {
                    await roleManager.CreateAsync(new IdentityRole<Guid> { Name = roleName });
                    logger.LogInformation("Created role: {Role}", roleName);
                }
            }

            // 3. Platform Admin Seeding
            await SeedPlatformAdminAsync();

            // 4. Storage Initialization
            logger.LogInformation("Initializing MinIO buckets...");
            foreach (var bucket in _buckets)
            {
                var existsArgs = new BucketExistsArgs().WithBucket(bucket);
                bool exists = await minioClient.BucketExistsAsync(existsArgs);

                if (!exists)
                {
                    logger.LogInformation("Creating MinIO bucket: {Bucket}", bucket);
                    var makeArgs = new MakeBucketArgs().WithBucket(bucket);
                    await minioClient.MakeBucketAsync(makeArgs);
                }
            }
            logger.LogInformation("MinIO buckets initialized successfully.");

            logger.LogInformation("Application infrastructure initialization completed successfully.");
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred during application infrastructure initialization.");
            throw;
        }
    }

    private async Task SeedPlatformAdminAsync()
    {
        var adminEmail = configuration["Seed:AdminEmail"] ?? "admin@zarife.com";
        var adminPassword = configuration["Seed:AdminPassword"] ?? "Admin123!";

        var adminUser = await userManager.FindByEmailAsync(adminEmail);
        if (adminUser == null)
        {
            logger.LogInformation("Seeding Platform Admin: {Email}", adminEmail);
            adminUser = new ApplicationUser
            {
                UserName = adminEmail,
                Email = adminEmail,
                EmailConfirmed = true,
                Role = "PlatformAdmin",
                TenantId = null // Platform admins are not scoped to a tenant
            };

            var result = await userManager.CreateAsync(adminUser, adminPassword);
            if (result.Succeeded)
            {
                await userManager.AddToRoleAsync(adminUser, "PlatformAdmin");
                logger.LogInformation("Platform Admin created successfully.");
            }
            else
            {
                var errors = string.Join(", ", result.Errors.Select(e => e.Description));
                logger.LogError("Failed to create Platform Admin: {Errors}", errors);
            }
        }
    }
}
