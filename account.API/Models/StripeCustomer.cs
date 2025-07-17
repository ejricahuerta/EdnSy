using System;
using System.ComponentModel.DataAnnotations;

namespace account.API.Models
{
    public class StripeCustomer
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        public Guid UserId { get; set; } // FK to auth.users

        [Required]
        public string StripeCustomerId { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
} 