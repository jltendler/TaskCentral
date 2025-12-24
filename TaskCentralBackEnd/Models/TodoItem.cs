using System;

namespace TaskCentralBackEnd.Models
{
    public class TodoItem
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public bool IsCompleted { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow; //Let's avoid timezone woes, and use UTC.
        public DateTime? DueDate { get; set; } = null; //Default to no dueDate
        public bool IsPriority { get; set; }
        
        public int SortOrder { get; set; } = 0; //Default to 0, user will change

        public int TodoListId { get; set; }
        
        public TodoList? TodoList { get; set; } 
        //This is a navigation property.
        //It allows us to access the TodoList data from the ToDoItem, so we can do cool stuff like display the list name in the UI.
        //It does create a need to use ReferenceHandler.IgnoreCycles in the JsonSerializerOptions, but that's a small price to pay for the functionality.
    }
}
