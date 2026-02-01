using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Moq;
using Zarife.AI.Services;

namespace Zarife.Tests.Services;

public class TtsServiceTests
{
    private readonly Mock<IConfiguration> _configMock;
    private readonly Mock<ILogger<TtsService>> _loggerMock;
    private readonly TtsService _service;

    public TtsServiceTests()
    {
        _configMock = new Mock<IConfiguration>();
        _loggerMock = new Mock<ILogger<TtsService>>();
        _service = new TtsService(_configMock.Object, _loggerMock.Object);
    }

    [Fact]
    public async Task SynthesizeSpeechAsync_WhenNotConfigured_ReturnsError()
    {
        _configMock.Setup(c => c["AI:AzureSpeech:Key"]).Returns((string?)null);
        _configMock.Setup(c => c["AI:AzureSpeech:Region"]).Returns((string?)null);

        var request = new TtsRequest("Merhaba", "tr", null);

        var result = await _service.SynthesizeSpeechAsync(request);

        Assert.False(result.Success);
        Assert.Null(result.AudioData);
        Assert.Equal("Azure Speech not configured", result.ErrorMessage);
    }
}
