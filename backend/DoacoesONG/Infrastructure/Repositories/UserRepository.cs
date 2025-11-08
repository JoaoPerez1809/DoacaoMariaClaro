using Domain.Entities;
using Domain.Interfaces;
using Infrastructure.Data;


namespace Infrastructure.Repositories
{

    public class UserRepository : IUserRepository
    {
        private readonly AppDbContext _context;

        public UserRepository(AppDbContext context)
        {
            _context = context;
        }

        public void Add(User user)
        {
            _context.Users.Add(user);
            _context.SaveChanges();
        }

        public User? GetById(int id) => _context.Users.Find(id);

        public List<User> ListAll() => _context.Users?.ToList() ?? new List<User>();

        public void Update(User user)
        {
            _context.Users.Update(user);
            _context.SaveChanges();
        }

        public void Delete(int id)
        {
            var user = _context.Users.Find(id);
            if (user != null)
            {
                _context.Users.Remove(user);
                _context.SaveChanges();
            }
        }

        public User? GetByEmail(string email) => _context.Users.FirstOrDefault(u => u.Email == email);
    }
}