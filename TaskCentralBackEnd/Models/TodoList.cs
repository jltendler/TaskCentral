using System;
using System.Collections.Generic;

namespace TaskCentralBackEnd.Models
{
    public class TodoList
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public int OwnerId { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public List<TodoItem> Items { get; set; } = new List<TodoItem>();
    }
}
