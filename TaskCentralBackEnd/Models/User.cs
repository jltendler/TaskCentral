using System.ComponentModel.DataAnnotations;

namespace TaskCentralBackEnd.Models
{
    public class User
    {
        [Key]
        public string Id { get; set; } = string.Empty; // Username/ID (e.g. "jeanluc")
        public string Name { get; set; } = string.Empty; // Display Name (e.g. "Jean-Luc")
    }
}
