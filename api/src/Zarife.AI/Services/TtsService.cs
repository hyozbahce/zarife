using Microsoft.CognitiveServices.Speech;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace Zarife.AI.Services;

public class TtsService : ITtsService
{
    private readonly IConfiguration _config;
    private readonly ILogger<TtsService> _logger;

    private static readonly Dictionary<string, string> DefaultVoices = new()
    {
        ["tr"] = "tr-TR-EmelNeural",
        ["en"] = "en-US-JennyNeural",
        ["de"] = "de-DE-KatjaNeural",
        ["fr"] = "fr-FR-DeniseNeural",
    };

    public TtsService(IConfiguration config, ILogger<TtsService> logger)
    {
        _config = config;
        _logger = logger;
    }

    public async Task<TtsResult> SynthesizeSpeechAsync(TtsRequest request, CancellationToken ct = default)
    {
        try
        {
            var key = _config["AI:AzureSpeech:Key"];
            var region = _config["AI:AzureSpeech:Region"];

            if (string.IsNullOrEmpty(key) || string.IsNullOrEmpty(region))
            {
                _logger.LogWarning("Azure Speech not configured, returning empty result");
                return new TtsResult(false, null, null, null, "Azure Speech not configured");
            }

            var speechConfig = SpeechConfig.FromSubscription(key, region);
            speechConfig.SpeechSynthesisVoiceName = request.VoiceName
                ?? (DefaultVoices.TryGetValue(request.Language, out var v) ? v : "tr-TR-EmelNeural");
            speechConfig.SetSpeechSynthesisOutputFormat(SpeechSynthesisOutputFormat.Audio16Khz32KBitRateMonoMp3);

            var wordTimings = new List<WordTiming>();

            using var synthesizer = new SpeechSynthesizer(speechConfig, null);
            synthesizer.WordBoundary += (_, e) =>
            {
                wordTimings.Add(new WordTiming(
                    e.Text,
                    e.AudioOffset / 10_000.0,
                    (e.AudioOffset + (ulong)e.Duration.Ticks) / 10_000.0
                ));
            };

            var result = await synthesizer.SpeakTextAsync(request.Text);

            if (result.Reason == ResultReason.SynthesizingAudioCompleted)
            {
                return new TtsResult(true, result.AudioData, "audio/mpeg", wordTimings, null);
            }

            var cancellation = SpeechSynthesisCancellationDetails.FromResult(result);
            _logger.LogError("TTS failed: {Reason} - {Detail}", cancellation.Reason, cancellation.ErrorDetails);
            return new TtsResult(false, null, null, null, cancellation.ErrorDetails);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to synthesize speech");
            return new TtsResult(false, null, null, null, ex.Message);
        }
    }
}
