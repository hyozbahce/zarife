namespace Zarife.AI.Services;

public interface IStoryGenerationService
{
    Task<StoryGenerationResult> GenerateStoryAsync(StoryPrompt prompt, CancellationToken ct = default);
    Task<TranslationResult> TranslateStoryAsync(string text, string sourceLanguage, string targetLanguage, CancellationToken ct = default);
}

public sealed record StoryPrompt(
    string Topic,
    int TargetAgeMin,
    int TargetAgeMax,
    string Language,
    string? EducationalGoal,
    string? StyleNotes
);

public sealed record StoryGenerationResult(
    bool Success,
    string? Title,
    string? Text,
    string[]? Pages,
    string? ErrorMessage
);

public sealed record TranslationResult(
    bool Success,
    string? TranslatedText,
    string? ErrorMessage
);
