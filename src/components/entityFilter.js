export function filterEntities(entities, query) {
  if (!query) return entities;

  const lowercaseQuery = query.toLowerCase();

  return entities.filter(
    (entity) =>
      entity.name.toLowerCase().includes(lowercaseQuery) ||
      entity.type.toLowerCase().includes(lowercaseQuery) ||
      entity.description.toLowerCase().includes(lowercaseQuery)
  );
}
