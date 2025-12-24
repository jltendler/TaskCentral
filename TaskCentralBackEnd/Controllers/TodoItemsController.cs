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

        // GET: api/todoitems/priority
        [HttpGet("/api/todoitems/priority")]
        public async Task<ActionResult<IEnumerable<TodoItem>>> GetPriiorityItems()
        {
            return await _context.TodoItems
                .Where(i => i.IsPriority)
                .Include(i => i.TodoList) //This populates the TodoList via a LEFT JOIN. 'Eager Loading'.
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
            
            return await _context.TodoItems
                .Where(i => !i.IsCompleted && i.DueDate != null && i.DueDate >= startRange && i.DueDate <= endRange)
                .Include(i => i.TodoList)
                .ToListAsync();
        }

        // GET: api/todoitems/overdue
        [HttpGet("/api/todoitems/overdue")]
        public async Task<ActionResult<IEnumerable<TodoItem>>> GetOverdueItems()
        {
            // Use a wider range (including today/tomorrow) so the client can filter strictly locally.
            var tomorrow = DateTime.UtcNow.AddDays(1).Date;
            
            return await _context.TodoItems
                .Where(i => !i.IsCompleted && i.DueDate != null && i.DueDate < tomorrow)
                .Include(i => i.TodoList)
                .ToListAsync();
        }

        // GET: api/todolists/1/items
        [HttpGet("/api/todolists/{listId}/items")]
        public async Task<ActionResult<IEnumerable<TodoItem>>> GetTodoItems(int listId)
        {
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
