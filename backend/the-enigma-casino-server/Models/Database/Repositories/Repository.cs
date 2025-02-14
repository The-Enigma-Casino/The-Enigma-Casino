using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using System.Linq.Expressions;

namespace the_enigma_casino_server.Models.Database.Repositories;

public abstract class Repository<TEntity, TId> : IRepository<TEntity, TEntity> where TEntity : class
{
    protected MyDbContext Context { get; init; }

    public Repository(MyDbContext context)
    {
        Context = context;
    }

    public async Task<ICollection<TEntity>> GetAllAsync()
    {
        return await Context.Set<TEntity>().ToArrayAsync();
    }

    public IQueryable<TEntity> GetQueryable(bool asNoTracking = true)
    {
        DbSet<TEntity> entities = Context.Set<TEntity>();

        return asNoTracking ? entities.AsNoTracking() : entities;
    }

    public async Task<TEntity> InsertAsync(TEntity entity)
    {
        EntityEntry<TEntity> entry = await Context.Set<TEntity>().AddAsync(entity);

        return entry.Entity;
    }

    public async Task<TEntity> GetByIdAsync(object id)
    {
        return await Context.Set<TEntity>().FindAsync(id);
    }

    public async Task<bool> ExistsAsync(object id)
    {
        return await GetByIdAsync(id) != null;
    }

    public async Task<List<TEntity>> FindAsync(Expression<Func<TEntity, bool>> predicate)
    {
        return await Context.Set<TEntity>().Where(predicate).ToListAsync();
    }

    public virtual async Task SaveAsync()
    {
        await Context.SaveChangesAsync();
    }

    public void Update(TEntity entity)
    {
        Context.Set<TEntity>().Update(entity);
    }

    public void Delete(TEntity entity)
    {
        Context.Set<TEntity>().Remove(entity);
    }
}

