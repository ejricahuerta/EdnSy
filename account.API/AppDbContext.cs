using Microsoft.EntityFrameworkCore;
using account.API.Models;

namespace account.API
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<UserExternalAccount> UserExternalAccounts { get; set; }
        public DbSet<StripeCustomer> StripeCustomers { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<UserExternalAccount>()
                .HasIndex(u => new { u.UserId, u.Provider })
                .IsUnique();

            modelBuilder.Entity<StripeCustomer>()
                .HasIndex(s => s.UserId)
                .IsUnique();

            // Do not configure .HasOne<object>() for Supabase auth.users foreign key
            // The FK will be enforced in the database, not by EF Core
        }
    }
} 