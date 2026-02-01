using System.Text.Json;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Zarife.Core.DTOs.Books;
using Zarife.Core.Entities;
using Zarife.Infrastructure.Data;

namespace Zarife.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class BooksController(ApplicationDbContext context) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IEnumerable<BookResponse>>> GetBooks(
        [FromQuery] string? status,
        [FromQuery] string? search,
        [FromQuery] string? language)
    {
        var query = context.Books.AsQueryable();

        if (!string.IsNullOrEmpty(status))
            query = query.Where(b => b.Status == status);

        if (!string.IsNullOrEmpty(search))
            query = query.Where(b => b.Title.Contains(search) || (b.Author != null && b.Author.Contains(search)));

        if (!string.IsNullOrEmpty(language))
            query = query.Where(b => b.Language == language);

        var dbBooks = await query
            .OrderByDescending(b => b.CreatedAt)
            .ToListAsync();

        var books = dbBooks.Select(b => new BookResponse(
            b.Id, b.Title, b.Author, b.Illustrator, b.Language,
            b.TargetAgeMin, b.TargetAgeMax, b.DurationMinutes,
            b.CoverImageUrl, b.Description, b.Status,
            b.CategoriesJson != null ? JsonSerializer.Deserialize<string[]>(b.CategoriesJson) : null,
            b.PageCount, b.CreatedAt));

        return Ok(books);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<BookDetailResponse>> GetBook(Guid id)
    {
        var book = await context.Books
            .Include(b => b.Pages.OrderBy(p => p.PageNumber))
            .FirstOrDefaultAsync(b => b.Id == id);

        if (book == null) return NotFound();

        return Ok(new BookDetailResponse(
            book.Id, book.Title, book.Author, book.Illustrator, book.Language,
            book.TargetAgeMin, book.TargetAgeMax, book.DurationMinutes,
            book.CoverImageUrl, book.Description, book.Status,
            book.CategoriesJson != null ? JsonSerializer.Deserialize<string[]>(book.CategoriesJson) : null,
            book.PageCount, book.CreatedAt,
            book.Pages.Select(p => new BookPageResponse(
                p.Id, p.PageNumber, p.RiveFileUrl, p.StateMachine,
                p.Artboard, p.NarrationAudioUrl, p.NarrationText))));
    }

    [HttpPost]
    [Authorize(Roles = "PlatformAdmin,SchoolAdmin")]
    public async Task<ActionResult<BookResponse>> CreateBook(CreateBookRequest request)
    {
        var book = new Book
        {
            Title = request.Title,
            Author = request.Author,
            Illustrator = request.Illustrator,
            Language = request.Language,
            TargetAgeMin = request.TargetAgeMin,
            TargetAgeMax = request.TargetAgeMax,
            DurationMinutes = request.DurationMinutes,
            Description = request.Description,
            CategoriesJson = request.Categories != null ? JsonSerializer.Serialize(request.Categories) : null,
            Status = "Draft"
        };

        context.Books.Add(book);
        await context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetBook), new { id = book.Id }, new BookResponse(
            book.Id, book.Title, book.Author, book.Illustrator, book.Language,
            book.TargetAgeMin, book.TargetAgeMax, book.DurationMinutes,
            book.CoverImageUrl, book.Description, book.Status,
            request.Categories, book.PageCount, book.CreatedAt));
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "PlatformAdmin,SchoolAdmin")]
    public async Task<ActionResult<BookResponse>> UpdateBook(Guid id, UpdateBookRequest request)
    {
        var book = await context.Books.FindAsync(id);
        if (book == null) return NotFound();

        book.Title = request.Title;
        book.Author = request.Author;
        book.Illustrator = request.Illustrator;
        book.Language = request.Language;
        book.TargetAgeMin = request.TargetAgeMin;
        book.TargetAgeMax = request.TargetAgeMax;
        book.DurationMinutes = request.DurationMinutes;
        book.Description = request.Description;
        book.CategoriesJson = request.Categories != null ? JsonSerializer.Serialize(request.Categories) : null;
        if (!string.IsNullOrEmpty(request.Status))
            book.Status = request.Status;
        book.UpdatedAt = DateTime.UtcNow;

        await context.SaveChangesAsync();

        return Ok(new BookResponse(
            book.Id, book.Title, book.Author, book.Illustrator, book.Language,
            book.TargetAgeMin, book.TargetAgeMax, book.DurationMinutes,
            book.CoverImageUrl, book.Description, book.Status,
            request.Categories, book.PageCount, book.CreatedAt));
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "PlatformAdmin")]
    public async Task<IActionResult> DeleteBook(Guid id)
    {
        var book = await context.Books.FindAsync(id);
        if (book == null) return NotFound();

        context.Books.Remove(book);
        await context.SaveChangesAsync();

        return NoContent();
    }

    [HttpPost("{bookId}/pages")]
    [Authorize(Roles = "PlatformAdmin,SchoolAdmin")]
    public async Task<ActionResult<BookPageResponse>> CreatePage(Guid bookId, CreateBookPageRequest request)
    {
        var book = await context.Books.FindAsync(bookId);
        if (book == null) return NotFound();

        var page = new BookPage
        {
            BookId = bookId,
            PageNumber = request.PageNumber,
            RiveFileUrl = request.RiveFileUrl,
            StateMachine = request.StateMachine,
            Artboard = request.Artboard,
            NarrationText = request.NarrationText
        };

        context.BookPages.Add(page);
        book.PageCount = await context.BookPages.CountAsync(p => p.BookId == bookId) + 1;
        await context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetBook), new { id = bookId }, new BookPageResponse(
            page.Id, page.PageNumber, page.RiveFileUrl, page.StateMachine,
            page.Artboard, page.NarrationAudioUrl, page.NarrationText));
    }

    [HttpPut("{bookId}/pages/{pageId}")]
    [Authorize(Roles = "PlatformAdmin,SchoolAdmin")]
    public async Task<ActionResult<BookPageResponse>> UpdatePage(Guid bookId, Guid pageId, UpdateBookPageRequest request)
    {
        var page = await context.BookPages.FirstOrDefaultAsync(p => p.Id == pageId && p.BookId == bookId);
        if (page == null) return NotFound();

        page.PageNumber = request.PageNumber;
        page.RiveFileUrl = request.RiveFileUrl;
        page.StateMachine = request.StateMachine;
        page.Artboard = request.Artboard;
        page.NarrationAudioUrl = request.NarrationAudioUrl;
        page.NarrationText = request.NarrationText;
        page.WordTimingsJson = request.WordTimingsJson;
        page.InputsJson = request.InputsJson;
        page.TriggersJson = request.TriggersJson;
        page.UpdatedAt = DateTime.UtcNow;

        await context.SaveChangesAsync();

        return Ok(new BookPageResponse(
            page.Id, page.PageNumber, page.RiveFileUrl, page.StateMachine,
            page.Artboard, page.NarrationAudioUrl, page.NarrationText));
    }

    [HttpDelete("{bookId}/pages/{pageId}")]
    [Authorize(Roles = "PlatformAdmin,SchoolAdmin")]
    public async Task<IActionResult> DeletePage(Guid bookId, Guid pageId)
    {
        var page = await context.BookPages.FirstOrDefaultAsync(p => p.Id == pageId && p.BookId == bookId);
        if (page == null) return NotFound();

        context.BookPages.Remove(page);

        var book = await context.Books.FindAsync(bookId);
        if (book != null)
            book.PageCount = await context.BookPages.CountAsync(p => p.BookId == bookId) - 1;

        await context.SaveChangesAsync();

        return NoContent();
    }

    [HttpPut("{id}/publish")]
    [Authorize(Roles = "PlatformAdmin")]
    public async Task<IActionResult> PublishBook(Guid id)
    {
        var book = await context.Books.FindAsync(id);
        if (book == null) return NotFound();

        book.Status = "Published";
        book.UpdatedAt = DateTime.UtcNow;
        await context.SaveChangesAsync();

        return Ok(new { message = "Book published successfully" });
    }
}
