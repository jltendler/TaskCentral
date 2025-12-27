using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TaskCentralBackEnd.Data;
using TaskCentralBackEnd.Models;

namespace TaskCentralBackEnd.Controllers
{
    [ApiController]
    public class TodoItemsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public TodoItemsController(AppDbContext context)
        {
            _context = context;
        }

        private string GetCurrentUserId()
        {
            if (Request.Headers.TryGetValue("X-User-Id", out var userId))
            {
                return userId.ToString();
            }
            return "default";
        }

        // GET: api/todoitems/priority
        [HttpGet("/api/todoitems/priority")]
        public async Task<ActionResult<IEnumerable<TodoItem>>> GetPriiorityItems()
        {
            var userId = GetCurrentUserId();
            return await _context.TodoItems
                .Include(i => i.TodoList) 
                .Where(i => i.IsPriority && i.TodoList.OwnerId == userId)
                .ToListAsync();
        }

        // GET: api/todoitems/duesoon
        [HttpGet("/api/todoitems/duesoon")]
        public async Task<ActionResult<IEnumerable<TodoItem>>> GetDueSoonItems()
        {
            // Use a wider range (starting from yesterday) to ensure timezone shifts 
            // don't hide items that are "today" in the user's local time.
            var startRange = DateTime.UtcNow.AddDays(-1).Date;
            var endRange = DateTime.UtcNow.AddDays(8).Date;
            var userId = GetCurrentUserId();
            
            return await _context.TodoItems
                .Include(i => i.TodoList)
                .Where(i => !i.IsCompleted && i.DueDate != null && i.DueDate >= startRange && i.DueDate <= endRange && i.TodoList.OwnerId == userId)
                .ToListAsync();
        }

        // GET: api/todoitems/overdue
        [HttpGet("/api/todoitems/overdue")]
        public async Task<ActionResult<IEnumerable<TodoItem>>> GetOverdueItems()
        {
            // Use a wider range (including today/tomorrow) so the client can filter locally with timezone context.
            var tomorrow = DateTime.UtcNow.AddDays(1).Date;
            var userId = GetCurrentUserId();
            
            return await _context.TodoItems
                .Include(i => i.TodoList)
                .Where(i => !i.IsCompleted && i.DueDate != null && i.DueDate < tomorrow && i.TodoList.OwnerId == userId)
                .ToListAsync();
        }

        // GET: api/todolists/1/items
        [HttpGet("/api/todolists/{listId}/items")]
        public async Task<ActionResult<IEnumerable<TodoItem>>> GetTodoItems(int listId)
        {
            var userId = GetCurrentUserId();
            // Verify ownership of the list
            var list = await _context.TodoLists.FirstOrDefaultAsync(l => l.Id == listId && l.OwnerId == userId);
            if (list == null) return NotFound();

            return await _context.TodoItems.Where(i => i.TodoListId == listId).ToListAsync();
        }

        // POST: api/todolists/1/items
        [HttpPost("/api/todolists/{listId}/items")]
        public async Task<ActionResult<TodoItem>> PostTodoItem(int listId, TodoItem todoItem)
        {
            todoItem.TodoListId = listId;
            _context.TodoItems.Add(todoItem);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetTodoItems), new { listId = listId }, todoItem);
        }

        // POST: api/todolists/1/items/complete-all
        [HttpPost("/api/todolists/{listId}/items/complete-all")]
        public async Task<IActionResult> CompleteAll(int listId)
        {
            var items = await _context.TodoItems.Where(i => i.TodoListId == listId && !i.IsCompleted).ToListAsync();
            foreach (var item in items)
            {
                item.IsCompleted = true;
            }
            await _context.SaveChangesAsync();
            return NoContent();
        }

        // POST: api/todolists/1/items/uncomplete-all
        [HttpPost("/api/todolists/{listId}/items/uncomplete-all")]
        public async Task<IActionResult> UncompleteAll(int listId)
        {
            var items = await _context.TodoItems.Where(i => i.TodoListId == listId && i.IsCompleted).ToListAsync();
            foreach (var item in items)
            {
                item.IsCompleted = false;
            }
            await _context.SaveChangesAsync();
            return NoContent();
        }

        // PUT: api/todolists/1/items/5
        [HttpPut("/api/todolists/{listId}/items/{id}")]
        public async Task<IActionResult> PutTodoItem(int listId, int id, TodoItem todoItem)
        {
            if (id != todoItem.Id)
            {
                return BadRequest();
            }

            _context.Entry(todoItem).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!TodoItemExists(id))
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

        // DELETE: api/todolists/1/items/5
        [HttpDelete("/api/todolists/{listId}/items/{id}")]
        public async Task<IActionResult> DeleteTodoItem(int listId, int id)
        {
            var todoItem = await _context.TodoItems.FindAsync(id);
            if (todoItem == null)
            {
                return NotFound();
            }

            _context.TodoItems.Remove(todoItem);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool TodoItemExists(int id)
        {
            return _context.TodoItems.Any(e => e.Id == id);
        }
    }
}
