using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Moq;
using Zarife.AI.Services;

namespace Zarife.Tests.Services;

public class StoryGenerationServiceTests
{
    private readonly Mock<IConfiguration> _configMock;
    private readonly Mock<ILogger<StoryGenerationService>> _loggerMock;
    private readonly StoryGenerationService _service;

    public StoryGenerationServiceTests()
    {
        _configMock = new Mock<IConfiguration>();
        _loggerMock = new Mock<ILogger<StoryGenerationService>>();
        _service = new StoryGenerationService(_configMock.Object, _loggerMock.Object);
    }

    [Fact]
    public async Task GenerateStoryAsync_WhenNotConfigured_ReturnsPlaceholder()
    {
        // Arrange - no config values set, so endpoint/apiKey will be null
        _configMock.Setup(c => c["AI:AzureOpenAI:Endpoint"]).Returns((string?)null);
        _configMock.Setup(c => c["AI:AzureOpenAI:ApiKey"]).Returns((string?)null);

        var prompt = new StoryPrompt("A brave cat", 4, 8, "tr", null, null);

        // Act
        var result = await _service.GenerateStoryAsync(prompt);

        // Assert
        Assert.True(result.Success);
        Assert.NotNull(result.Title);
        Assert.NotNull(result.Text);
        Assert.NotNull(result.Pages);
        Assert.True(result.Pages.Length > 0);
        Assert.Contains("A brave cat", result.Title);
    }

    [Fact]
    public async Task GenerateStoryAsync_PlaceholderHasExpectedStructure()
    {
        var prompt = new StoryPrompt("Friendly dolphin", 3, 6, "tr", "Learning colors", null);

        var result = await _service.GenerateStoryAsync(prompt);

        Assert.True(result.Success);
        Assert.Equal("Friendly dolphin", result.Title);
        Assert.Equal(4, result.Pages!.Length);
        Assert.StartsWith("# ", result.Pages[0]);
    }

    [Fact]
    public async Task TranslateStoryAsync_WhenNotConfigured_ReturnsError()
    {
        _configMock.Setup(c => c["AI:AzureOpenAI:Endpoint"]).Returns((string?)null);

        var result = await _service.TranslateStoryAsync("Hello", "English", "Turkish");

        Assert.False(result.Success);
        Assert.Null(result.TranslatedText);
        Assert.NotNull(result.ErrorMessage);
    }
}
