using System.ComponentModel.DataAnnotations;

namespace TaskCentralBackEnd.Models
{
    public class User
    {
        [Key]
        public int Id { get; set; } // Auto-incrementing Integer ID
        public string Name { get; set; } = string.Empty; // Display Name (e.g. "Billy")
    }
}
