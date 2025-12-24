using Microsoft.EntityFrameworkCore;
using TaskCentralBackEnd.Models;

namespace TaskCentralBackEnd.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<TodoList> TodoLists { get; set; }
        public DbSet<TodoItem> TodoItems { get; set; }

        // Since everything is bog-standard so far, no need for any EF overrides
        // protected override void OnModelCreating(ModelBuilder modelBuilder)
        // {
        //     modelBuilder.Entity<TodoList>()
        //         .HasMany(l => l.Items)
        //         .WithOne(i => i.TodoList)
        //         .HasForeignKey(i => i.TodoListId);
        // }
    }
}
