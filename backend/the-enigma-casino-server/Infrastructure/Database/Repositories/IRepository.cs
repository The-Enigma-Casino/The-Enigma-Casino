using System.Linq.Expressions;

namespace the_enigma_casino_server.Infrastructure.Database.Repositories;

public interface IRepository<TEntity, TId> where TEntity : class
{
    Task<ICollection<TEntity>> GetAllAsync();

    IQueryable<TEntity> GetQueryable(bool asNoTracking = true);

    Task<TEntity> GetByIdAsync(object id);

    Task<List<TEntity>> FindAsync(Expression<Func<TEntity, bool>> predicate);

    Task<bool> ExistsAsync(object id);

    Task<TEntity> InsertAsync(TEntity entity);

    void Update(TEntity entity);

    void Delete(TEntity entity);

}