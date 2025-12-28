using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TaskCentralBackEnd.Data;
using TaskCentralBackEnd.Models;

namespace TaskCentralBackEnd.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TodoListsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public TodoListsController(AppDbContext context)
        {
            _context = context;
        }

        private int GetCurrentUserId()
        {
            if (Request.Headers.TryGetValue("X-User-Id", out var userId) && int.TryParse(userId, out var id))
            {
                return id;
            }
            return -1; // Default/Invalid
        }

        // GET: api/TodoLists
        [HttpGet]
        public async Task<ActionResult<IEnumerable<TodoList>>> GetTodoLists()
        {
            var userId = GetCurrentUserId();
            return await _context.TodoLists
                .Include(l => l.Items)
                .Where(l => l.OwnerId == userId)
                .ToListAsync();
        }

        // GET: api/TodoLists/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<TodoList>> GetTodoList(int id)
        {
            var userId = GetCurrentUserId();
            var todoList = await _context.TodoLists.Include(l => l.Items)
                .FirstOrDefaultAsync(l => l.Id == id && l.OwnerId == userId);

            if (todoList == null)
            {
                return NotFound();
            }

            return todoList;
        }

        // POST: api/TodoLists
        [HttpPost]
        public async Task<ActionResult<TodoList>> PostTodoList(TodoList todoList)
        {
            todoList.OwnerId = GetCurrentUserId();
            _context.TodoLists.Add(todoList);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetTodoList", new { id = todoList.Id }, todoList);
        }

        // PUT: api/TodoLists/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> PutTodoList(int id, TodoList todoList)
        {
            if (id != todoList.Id)
            {
                return BadRequest();
            }

            var userId = GetCurrentUserId();
            var existingList = await _context.TodoLists.AsNoTracking().FirstOrDefaultAsync(l => l.Id == id);
            
            if (existingList == null) return NotFound();
            if (existingList.OwnerId != userId) return Forbid();

            // Prevent changing the specific owner ID
            todoList.OwnerId = userId;

            _context.Entry(todoList).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException) //Happens when 0 rows are impacted by the update.
            {
                if (!TodoListExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // DELETE: api/TodoLists/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTodoList(int id)
        {
            var userId = GetCurrentUserId();
            var todoList = await _context.TodoLists.FirstOrDefaultAsync(l => l.Id == id && l.OwnerId == userId);
            if (todoList == null)
            {
                return NotFound();
            }
            //Delete all items in the list to avoid orphaned items.
            _context.TodoItems.RemoveRange(todoList.Items);
            _context.TodoLists.Remove(todoList);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool TodoListExists(int id)
        {
            return _context.TodoLists.Any(e => e.Id == id);
        }
    }
}
