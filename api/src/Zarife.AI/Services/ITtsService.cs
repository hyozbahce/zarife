namespace Zarife.AI.Services;

public interface ITtsService
{
    Task<TtsResult> SynthesizeSpeechAsync(TtsRequest request, CancellationToken ct = default);
}

public sealed record TtsRequest(
    string Text,
    string Language,
    string? VoiceName
);

public sealed record TtsResult(
    bool Success,
    byte[]? AudioData,
    string? ContentType,
    IReadOnlyList<WordTiming>? WordTimings,
    string? ErrorMessage
);

public sealed record WordTiming(
    string Word,
    double StartTimeMs,
    double EndTimeMs
);
