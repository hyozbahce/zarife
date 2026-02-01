using System;

namespace Zarife.Core.Common;

public class Result<T>
{
    public bool IsSuccess { get; }
    public T? Value { get; }
    public string? Error { get; }
    public string? Code { get; }

    protected Result(bool isSuccess, T? value, string? error = null, string? code = null)
    {
        IsSuccess = isSuccess;
        Value = value;
        Error = error;
        Code = code;
    }

    public static Result<T> Success(T value) => new(true, value);
    public static Result<T> Failure(string error, string? code = null) => new(false, default, error, code);
}

public class Result : Result<object>
{
    protected Result(bool isSuccess, string? error = null, string? code = null) 
        : base(isSuccess, null, error, code) { }

    public static new Result Success() => new(true);
    public static new Result Failure(string error, string? code = null) => new(false, error, code);
}
