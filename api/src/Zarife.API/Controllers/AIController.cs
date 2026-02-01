using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Zarife.AI.Services;

namespace Zarife.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AIController : ControllerBase
{
    private readonly IStoryGenerationService _storyService;
    private readonly ITtsService _ttsService;

    public AIController(IStoryGenerationService storyService, ITtsService ttsService)
    {
        _storyService = storyService;
        _ttsService = ttsService;
    }

    [HttpPost("generate-story")]
    [Authorize(Roles = "PlatformAdmin,SchoolAdmin")]
    public async Task<IActionResult> GenerateStory([FromBody] GenerateStoryRequest request, CancellationToken ct)
    {
        var prompt = new StoryPrompt(
            request.Topic,
            request.TargetAgeMin,
            request.TargetAgeMax,
            request.Language ?? "tr",
            request.EducationalGoal,
            request.StyleNotes
        );

        var result = await _storyService.GenerateStoryAsync(prompt, ct);

        if (!result.Success)
            return BadRequest(new { error = result.ErrorMessage });

        return Ok(new
        {
            result.Title,
            result.Text,
            result.Pages,
        });
    }

    [HttpPost("translate")]
    [Authorize(Roles = "PlatformAdmin,SchoolAdmin")]
    public async Task<IActionResult> TranslateStory([FromBody] TranslateRequest request, CancellationToken ct)
    {
        var result = await _storyService.TranslateStoryAsync(
            request.Text, request.SourceLanguage, request.TargetLanguage, ct);

        if (!result.Success)
            return BadRequest(new { error = result.ErrorMessage });

        return Ok(new { result.TranslatedText });
    }

    [HttpPost("tts")]
    [Authorize(Roles = "PlatformAdmin,SchoolAdmin,Teacher")]
    public async Task<IActionResult> TextToSpeech([FromBody] TtsRequestDto request, CancellationToken ct)
    {
        var ttsRequest = new TtsRequest(request.Text, request.Language ?? "tr", request.VoiceName);
        var result = await _ttsService.SynthesizeSpeechAsync(ttsRequest, ct);

        if (!result.Success)
            return BadRequest(new { error = result.ErrorMessage });

        return Ok(new
        {
            audioBase64 = result.AudioData != null ? Convert.ToBase64String(result.AudioData) : null,
            result.ContentType,
            result.WordTimings,
        });
    }
}

public record GenerateStoryRequest(
    string Topic,
    int TargetAgeMin = 4,
    int TargetAgeMax = 8,
    string? Language = "tr",
    string? EducationalGoal = null,
    string? StyleNotes = null
);

public record TranslateRequest(
    string Text,
    string SourceLanguage,
    string TargetLanguage
);

public record TtsRequestDto(
    string Text,
    string? Language = "tr",
    string? VoiceName = null
);
