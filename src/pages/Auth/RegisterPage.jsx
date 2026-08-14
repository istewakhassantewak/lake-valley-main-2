import AuthForm from '../../components/Auth/AuthForm';

export default function RegisterPage() {
  return (
    <section className="min-h-screen pt-28 pb-16 section-padding bg-surface flex items-center justify-center">
      <div className="max-w-md w-full mx-auto">
        <AuthForm initialMode="register" />
      </div>
    </section>
  );
}
