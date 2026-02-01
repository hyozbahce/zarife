using Zarife.Core.Entities;

namespace Zarife.Tests.Models;

public class EntityTests
{
    [Fact]
    public void Book_DefaultValues_AreCorrect()
    {
        var book = new Book();

        Assert.Equal("Draft", book.Status);
        Assert.Equal(0, book.PageCount);
        Assert.NotEqual(default, book.CreatedAt);
    }

    [Fact]
    public void Class_DefaultValues_AreCorrect()
    {
        var cls = new Class
        {
            Name = "Test Class",
            GradeLevel = 3,
            TenantId = Guid.NewGuid()
        };

        Assert.Equal("Test Class", cls.Name);
        Assert.Equal(3, cls.GradeLevel);
    }

    [Fact]
    public void ReadingProgress_DefaultValues_AreCorrect()
    {
        var progress = new ReadingProgress
        {
            BookId = Guid.NewGuid(),
            UserId = Guid.NewGuid()
        };

        Assert.Equal(0, progress.CurrentPage);
        Assert.False(progress.IsCompleted);
    }

    [Fact]
    public void StoryPrompt_Record_Equality()
    {
        var p1 = new AI.Services.StoryPrompt("Topic", 4, 8, "tr", null, null);
        var p2 = new AI.Services.StoryPrompt("Topic", 4, 8, "tr", null, null);

        Assert.Equal(p1, p2);
    }

    [Fact]
    public void StoryGenerationResult_Record_Properties()
    {
        var result = new AI.Services.StoryGenerationResult(true, "Title", "Text", new[] { "Page1" }, null);

        Assert.True(result.Success);
        Assert.Equal("Title", result.Title);
        Assert.Single(result.Pages!);
    }
}
