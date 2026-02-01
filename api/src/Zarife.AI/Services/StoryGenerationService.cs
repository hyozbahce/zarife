using System.ClientModel;
using Azure.AI.OpenAI;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using OpenAI.Chat;

namespace Zarife.AI.Services;

public class StoryGenerationService : IStoryGenerationService
{
    private readonly IConfiguration _config;
    private readonly ILogger<StoryGenerationService> _logger;

    public StoryGenerationService(IConfiguration config, ILogger<StoryGenerationService> logger)
    {
        _config = config;
        _logger = logger;
    }

    public async Task<StoryGenerationResult> GenerateStoryAsync(StoryPrompt prompt, CancellationToken ct = default)
    {
        try
        {
            var endpoint = _config["AI:AzureOpenAI:Endpoint"];
            var apiKey = _config["AI:AzureOpenAI:ApiKey"];
            var deployment = _config["AI:AzureOpenAI:DeploymentName"] ?? "gpt-4o";

            if (string.IsNullOrEmpty(endpoint) || string.IsNullOrEmpty(apiKey))
            {
                _logger.LogWarning("Azure OpenAI not configured, returning placeholder story");
                return GeneratePlaceholderStory(prompt);
            }

            var client = new AzureOpenAIClient(new Uri(endpoint), new ApiKeyCredential(apiKey));
            var chatClient = client.GetChatClient(deployment);

            var systemPrompt = BuildSystemPrompt(prompt);
            var userMessage = BuildUserMessage(prompt);

            var response = await chatClient.CompleteChatAsync(
                [
                    new SystemChatMessage(systemPrompt),
                    new UserChatMessage(userMessage)
                ],
                new ChatCompletionOptions { Temperature = 0.8f, MaxOutputTokenCount = 2000 },
                ct);

            var text = response.Value.Content[0].Text;
            var pages = text.Split("\n\n", StringSplitOptions.RemoveEmptyEntries);
            var title = pages.Length > 0 ? pages[0].Replace("# ", "").Trim() : prompt.Topic;

            return new StoryGenerationResult(true, title, text, pages, null);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to generate story");
            return new StoryGenerationResult(false, null, null, null, ex.Message);
        }
    }

    public async Task<TranslationResult> TranslateStoryAsync(string text, string sourceLanguage, string targetLanguage, CancellationToken ct = default)
    {
        try
        {
            var endpoint = _config["AI:AzureOpenAI:Endpoint"];
            var apiKey = _config["AI:AzureOpenAI:ApiKey"];
            var deployment = _config["AI:AzureOpenAI:DeploymentName"] ?? "gpt-4o";

            if (string.IsNullOrEmpty(endpoint) || string.IsNullOrEmpty(apiKey))
            {
                return new TranslationResult(false, null, "Azure OpenAI not configured");
            }

            var client = new AzureOpenAIClient(new Uri(endpoint), new ApiKeyCredential(apiKey));
            var chatClient = client.GetChatClient(deployment);

            var response = await chatClient.CompleteChatAsync(
                [
                    new SystemChatMessage($"Translate the following children's story from {sourceLanguage} to {targetLanguage}. Maintain the story structure and age-appropriate tone. Adapt cultural references naturally."),
                    new UserChatMessage(text)
                ],
                new ChatCompletionOptions { Temperature = 0.3f },
                ct);

            return new TranslationResult(true, response.Value.Content[0].Text, null);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to translate story");
            return new TranslationResult(false, null, ex.Message);
        }
    }

    private static string BuildSystemPrompt(StoryPrompt prompt)
    {
        var lang = prompt.Language == "tr" ? "Turkish" : prompt.Language == "en" ? "English" : prompt.Language;
        return $"""
            You are a professional children's story writer. Write stories in {lang} for children aged {prompt.TargetAgeMin}-{prompt.TargetAgeMax}.

            Guidelines:
            - Use simple, age-appropriate vocabulary
            - Each paragraph should be a "page" in a picture book (2-3 sentences max)
            - Include vivid imagery that can be illustrated
            - Start with a title on the first line prefixed with "# "
            - Separate each page with a blank line
            - Make the story engaging with a clear beginning, middle, and end
            - Target 5-8 pages total
            {(prompt.EducationalGoal != null ? $"- Educational goal: {prompt.EducationalGoal}" : "")}
            {(prompt.StyleNotes != null ? $"- Style notes: {prompt.StyleNotes}" : "")}
            """;
    }

    private static string BuildUserMessage(StoryPrompt prompt)
    {
        return $"Write a children's story about: {prompt.Topic}";
    }

    private static StoryGenerationResult GeneratePlaceholderStory(StoryPrompt prompt)
    {
        var pages = new[]
        {
            $"# {prompt.Topic}",
            $"Bir varmis bir yokmis, {prompt.Topic} hakkinda guzel bir hikaye varmis.",
            "Bu hikayede cocuklar yeni seyler ogrenecek ve eglenceli vakit gecirecekler.",
            "Ve herkes mutlu mesut yasamis. Son."
        };
        return new StoryGenerationResult(true, prompt.Topic, string.Join("\n\n", pages), pages, null);
    }
}
