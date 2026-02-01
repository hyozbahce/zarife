using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Zarife.Core.Entities;
using Zarife.Infrastructure.Data;

namespace Zarife.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SchoolsController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public SchoolsController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<School>>> GetSchools()
    {
        return await _context.Schools.ToListAsync();
    }
}
