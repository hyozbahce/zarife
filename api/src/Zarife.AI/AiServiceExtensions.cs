using Microsoft.Extensions.DependencyInjection;
using Zarife.AI.Services;

namespace Zarife.AI;

public static class AiServiceExtensions
{
    public static IServiceCollection AddZarifeAI(this IServiceCollection services)
    {
        services.AddScoped<IStoryGenerationService, StoryGenerationService>();
        services.AddScoped<ITtsService, TtsService>();
        return services;
    }
}
